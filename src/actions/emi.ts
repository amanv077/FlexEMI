'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { sendEmail } from "@/lib/email"

export async function payEMI(emiId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "LOAN_TAKER") {
    return { error: "Unauthorized" };
  }

  try {
    // 1. Verify ownership and status
    const emi = await prisma.eMI.findUnique({
      where: { id: emiId },
      include: {
        loan: {
          include: {
            lender: true,
            borrower: true,
          },
        },
      },
    });

    if (!emi) return { error: "EMI not found" };
    if (emi.loan.borrowerId !== session.user.id)
      return { error: "Unauthorized" };
    if (emi.status === "PAID") return { error: "EMI already paid" };
    if (emi.status === "AWAITING_APPROVAL")
      return { error: "Payment already submitted for approval" };

    // 2. Mark EMI as AWAITING_APPROVAL (instead of PAID)
    await prisma.eMI.update({
      where: { id: emiId },
      data: {
        status: "AWAITING_APPROVAL",
        // Don't set paidDate yet - will be set on approval
      },
    });

    // Notify Lender about pending approval
    if (emi.loan.lender.email) {
      await sendEmail({
        to: emi.loan.lender.email,
        subject: "Payment Pending Approval - FlexEMI",
        text: `${
          emi.loan.borrower.name || emi.loan.borrower.email
        } has submitted a payment of ₹${
          emi.amount
        } for approval. Please log in to approve or reject.`,
      });
    }

    revalidatePath("/borrower");
    revalidatePath("/lender");
    return { success: true };
  } catch (error) {
    console.error("Payment error:", error);
    return { error: "Failed to process payment" };
  }
}

export async function approvePayment(emiId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "LOAN_GIVER") {
    return { error: "Unauthorized" };
  }

  try {
    const emi = await prisma.eMI.findUnique({
      where: { id: emiId },
      include: {
        loan: {
          include: {
            borrower: true,
          },
        },
      },
    });

    if (!emi) return { error: "EMI not found" };
    if (emi.loan.lenderId !== session.user.id) return { error: "Unauthorized" };
    if (emi.status !== "AWAITING_APPROVAL")
      return { error: "EMI is not pending approval" };

    // Mark as PAID
    await prisma.eMI.update({
      where: { id: emiId },
      data: {
        status: "PAID",
        paidDate: new Date(),
      },
    });

    // Check if all EMIs for this loan are paid
    const remainingEmis = await prisma.eMI.count({
      where: {
        loanId: emi.loanId,
        status: { not: "PAID" },
      },
    });

    // If no pending EMIs, mark loan as COMPLETED
    if (remainingEmis === 0) {
      await prisma.loan.update({
        where: { id: emi.loanId },
        data: { status: "COMPLETED" },
      });
    }

    // Notify borrower
    if (emi.loan.borrower.email) {
      await sendEmail({
        to: emi.loan.borrower.email,
        subject: "Payment Approved - FlexEMI",
        text: `Your payment of ₹${emi.amount} has been approved and marked as paid.`,
      });
    }

    revalidatePath("/borrower");
    revalidatePath("/lender");
    return { success: true };
  } catch (error) {
    console.error("Approval error:", error);
    return { error: "Failed to approve payment" };
  }
}

export async function rejectPayment(emiId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "LOAN_GIVER") {
    return { error: "Unauthorized" };
  }

  try {
    const emi = await prisma.eMI.findUnique({
      where: { id: emiId },
      include: {
        loan: {
          include: {
            borrower: true,
          },
        },
      },
    });

    if (!emi) return { error: "EMI not found" };
    if (emi.loan.lenderId !== session.user.id) return { error: "Unauthorized" };
    if (emi.status !== "AWAITING_APPROVAL")
      return { error: "EMI is not pending approval" };

    // Revert to PENDING
    await prisma.eMI.update({
      where: { id: emiId },
      data: {
        status: "PENDING",
      },
    });

    // Notify borrower
    if (emi.loan.borrower.email) {
      await sendEmail({
        to: emi.loan.borrower.email,
        subject: "Payment Rejected - FlexEMI",
        text: `Your payment of ₹${emi.amount} was rejected. Please contact your lender or try again.`,
      });
    }

    revalidatePath("/borrower");
    revalidatePath("/lender");
    return { success: true };
  } catch (error) {
    console.error("Rejection error:", error);
    return { error: "Failed to reject payment" };
  }
}

export async function markUnpaid(emiId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "LOAN_GIVER") {
    return { error: "Unauthorized" };
  }

  try {
    const emi = await prisma.eMI.findUnique({
      where: { id: emiId },
      include: {
        loan: {
          include: {
            borrower: true,
          },
        },
      },
    });

    if (!emi) return { error: "EMI not found" };
    if (emi.loan.lenderId !== session.user.id) return { error: "Unauthorized" };
    if (emi.status !== "PAID") return { error: "EMI is not marked as paid" };

    // Revert to PENDING
    await prisma.eMI.update({
      where: { id: emiId },
      data: {
        status: "PENDING",
        paidDate: null,
      },
    });

    // Notify borrower
    if (emi.loan.borrower.email) {
      await sendEmail({
        to: emi.loan.borrower.email,
        subject: "Payment Marked Unpaid - FlexEMI",
        text: `Your payment of ₹${emi.amount} has been marked as unpaid by the lender. Please contact them for details.`,
      });
    }

    revalidatePath("/borrower");
    revalidatePath("/lender");
    revalidatePath(`/lender/loans/${emi.loanId}`);
    return { success: true };
  } catch (error) {
    console.error("Mark unpaid error:", error);
    return { error: "Failed to mark as unpaid" };
  }
}
