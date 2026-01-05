import { getAdminStats } from '@/actions/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, FileText, Wallet } from 'lucide-react'
import { CheckLateFeesButton } from '@/components/check-late-fees-button'

export default async function AdminDashboard() {
  const stats = await getAdminStats()

  if (!stats) {
    return <div>Unauthorized</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Admin Dashboard</h1>
        <CheckLateFeesButton />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLoans}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Disbursed</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalLent.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Recent Users</h2>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200">
              {stats.recentUsers.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-4">
                        <div>
                          <p className="font-medium text-gray-900">{user.name || 'Unnamed'}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{user.role}</Badge>
                          <span className="text-xs text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
