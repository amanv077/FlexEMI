'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { sendEmail } from "@/lib/email";

const createLoanSchema = z.object({
  borrowerEmail: z.string().email(),
  amount: z.coerce.number().positive(),
  interestRate: z.coerce.number().min(0),
  tenure: z.coerce.number().int().positive(), // months
  startDate: z.string().date(), // YYYY-MM-DD
  lateFeeAmount: z.coerce.number().min(0).default(500),
  loanName: z.string().optional(),
  createBorrower: z.string().nullable().optional(), // "on" if checked
  borrowerName: z.string().nullable().optional(),
  borrowerPassword: z.string().nullable().optional(),
});

export async function createLoan(
  prevState: string | undefined,
  formData: FormData
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "LOAN_GIVER") {
    return "Unauthorized";
  }

  const validatedFields = createLoanSchema.safeParse({
    borrowerEmail: formData.get("borrowerEmail"),
    amount: formData.get("amount"),
    interestRate: formData.get("interestRate"),
    tenure: formData.get("tenure"),
    startDate: formData.get("startDate"),
    lateFeeAmount: formData.get("lateFeeAmount"),
    loanName: formData.get("loanName"),
    createBorrower: formData.get("createBorrower"),
    borrowerName: formData.get("borrowerName"),
    borrowerPassword: formData.get("borrowerPassword"),
  });

  if (!validatedFields.success) {
    console.error(
      "Validation failed:",
      validatedFields.error.flatten().fieldErrors
    );
    return `Invalid fields: ${JSON.stringify(
      validatedFields.error.flatten().fieldErrors
    )}`;
  }

  const {
    borrowerEmail,
    amount,
    interestRate,
    tenure,
    startDate,
    lateFeeAmount,
    loanName,
    createBorrower,
    borrowerName,
    borrowerPassword,
  } = validatedFields.data;

  let borrower = await prisma.user.findUnique({
    where: { email: borrowerEmail },
  });

  // Handle Borrower Creation logic
  if (createBorrower === "on") {
    if (borrower) {
      return "User with this email already exists. Uncheck 'Create New Borrower'.";
    }
    if (!borrowerName || !borrowerPassword) {
      return "Name and Password are required to create a new borrower.";
    }

    try {
      borrower = await prisma.user.create({
        data: {
          email: borrowerEmail,
          name: borrowerName,
          password: borrowerPassword, // TODO: Hash this
          role: "LOAN_TAKER",
        },
      });
    } catch (e) {
      console.error("Failed to create borrower:", e);
      return "Failed to create new borrower account.";
    }
  } else {
    if (!borrower) {
      return "Borrower not found. Enable 'Create New Borrower' to sign them up.";
    }
  }

  if (borrower.id === session.user.id) {
    return "You cannot lend money to yourself.";
  }

  try {
    const loan = await prisma.loan.create({
      data: {
        name: loanName,
        amount,
        interestRate,
        tenure,
        startDate: new Date(startDate),
        lateFeeAmount: lateFeeAmount,
        lenderId: session.user.id,
        borrowerId: borrower.id,
        status: "ACTIVE",
      },
    });

    // Generate EMIs
    // Simple EMI calculation: P * r * (1+r)^n / ((1+r)^n - 1)
    // Monthly Interest Rate r = R / (12 * 100)

    const r = interestRate / (12 * 100);
    let emiAmount = 0;
    if (interestRate === 0) {
      emiAmount = amount / tenure;
    } else {
      emiAmount =
        (amount * r * Math.pow(1 + r, tenure)) / (Math.pow(1 + r, tenure) - 1);
    }

    // Round to 2 decimals
    emiAmount = Math.round(emiAmount * 100) / 100;

    const emiPromises = [];
    let currentDate = new Date(startDate);

    for (let i = 1; i <= tenure; i++) {
      // Add 1 month for next due date
      currentDate.setMonth(currentDate.getMonth() + 1);

      emiPromises.push(
        prisma.eMI.create({
          data: {
            amount: emiAmount,
            dueDate: new Date(currentDate),
            loanId: loan.id,
            status: "PENDING",
          },
        })
      );
    }

    await Promise.all(emiPromises);

    try {
      await sendEmail({
        to: borrower.email,
        subject: "New Loan Assigned - FlexEMI",
        text: `You have been assigned a new loan of ₹${amount} by ${session.user.email}. Please log in to view details.`,
      });
    } catch (e) {
      console.error("Email notification failed:", e);
    }
  } catch (error) {
    console.error("Failed to create loan:", error);
    return "Failed to create loan.";
  }

  revalidatePath("/lender");
  redirect("/lender");
}

export async function getLenderLoans() {
  const session = await auth();
  if (!session?.user || session.user.role !== "LOAN_GIVER") return [];

  const loans = await prisma.loan.findMany({
    where: { lenderId: session.user.id },
    include: {
      borrower: {
        select: { name: true, email: true },
      },
      emis: true, // Include likely needed for progress calculation
    },
    orderBy: { createdAt: "desc" },
  });
  return loans;
}

export async function getBorrowerLoans() {
  const session = await auth();
  if (!session?.user || session.user.role !== "LOAN_TAKER") return [];

  const loans = await prisma.loan.findMany({
    where: { borrowerId: session.user.id },
    include: {
      lender: {
        select: { name: true, email: true },
      },
      emis: {
        orderBy: { dueDate: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return loans;
}

export async function getLoanDetails(loanId: string) {
  const session = await auth();
  if (!session?.user) return null; // allow both roles, check ownership later

  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    include: {
      borrower: {
        select: { name: true, email: true },
      },
      lender: {
        select: { name: true, email: true },
      },
      emis: {
        orderBy: { dueDate: "asc" },
      },
      charges: {
        orderBy: { date: "desc" },
      },
    },
  });

  if (!loan) return null;

  // Security check: User must be either the lender or the borrower
  const isLender = loan.lenderId === session.user.id;
  const isBorrower = loan.borrowerId === session.user.id;

  if (!isLender && !isBorrower) {
    return null;
  }

  return loan;
}

export async function toggleArchiveLoan(loanId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "LOAN_GIVER")
    return { error: "Unauthorized" };

  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
  });

  if (!loan) return { error: "Loan not found" };
  if (loan.lenderId !== session.user.id) return { error: "Unauthorized" };

  try {
    await prisma.loan.update({
      where: { id: loanId },
      data: { isArchived: !loan.isArchived },
    });
    revalidatePath("/lender");
    revalidatePath("/borrower");
    revalidatePath(`/lender/loans/${loanId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle archive:", error);
    return { error: "Failed to update loan" };
  }
}
