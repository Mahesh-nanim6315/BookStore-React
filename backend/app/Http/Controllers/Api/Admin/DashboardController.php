<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        try {
            $totalOrders = Order::count();

            $totalRevenue = Order::where('payment_status', 'paid')
                ->sum('total_amount');

            $totalUsers = User::count();
            $totalBooks = Book::count();

            $recentOrders = Order::with('user')
                ->latest()
                ->take(5)
                ->get();

            $lowStockBooks = Book::where('has_paperback', true)
                ->where('stock', '<', 5)
                ->orderBy('stock', 'asc')
                ->take(5)
                ->get();

            $topSellingBooks = OrderItem::select(
                'book_id',
                DB::raw('SUM(quantity) as total_sold')
            )
                ->groupBy('book_id')
                ->orderByDesc('total_sold')
                ->with('book')
                ->take(5)
                ->get();

            $monthlySales = Order::select(
                DB::raw('MONTH(created_at) as month'),
                DB::raw('SUM(total_amount) as total')
            )
                ->where('payment_status', 'paid')
                ->groupBy(DB::raw('MONTH(created_at)'))
                ->orderBy(DB::raw('MONTH(created_at)'))
                ->get();

            $months = [];
            $sales = [];

            foreach ($monthlySales as $data) {
                $months[] = date('F', mktime(0, 0, 0, $data->month, 1));
                $sales[] = $data->total;
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'total_orders' => $totalOrders,
                    'total_revenue' => $totalRevenue,
                    'total_users' => $totalUsers,
                    'total_books' => $totalBooks,
                    'chart_data' => [
                        'months' => $months,
                        'sales' => $sales,
                    ],
                    'recent_orders' => $recentOrders,
                    'low_stock_books' => $lowStockBooks,
                    'top_selling_books' => $topSellingBooks,
                ],
            ]);
            } catch (\Throwable $e) {
                $this->logRequestErrorAuto($e);

                return response()->json([
                'success' => false,
                'message' => 'An error occurred while loading dashboard data.'
            ], 500);
        }
    }

    public function dashboard()
    {
        try {
            $user = Auth::user();
            $statusCode = 200;

            if (! $user) {
                $response = [
                    'success' => false,
                    'message' => 'Unauthenticated',
                ];
                $statusCode = 401;
            } elseif (! $user->hasPermission('access_dashboard')) {
                $response = [
                    'success' => false,
                    'message' => 'Unauthorized access',
                ];
                $statusCode = 403;
            } else {
                $dashboardType = strtolower((string) $user->role) === 'admin' ? 'admin' : 'dashboard';

                $response = [
                    'success' => true,
                    'data' => [
                        'dashboard_type' => $dashboardType,
                        'user' => [
                            'id' => $user->id,
                            'name' => $user->name,
                            'email' => $user->email,
                            'role' => $user->role,
                            'permissions' => $user->permissions(),
                        ],
                    ],
                ];
            }

            return response()->json($response, $statusCode);
            } catch (\Throwable $e) {
                $this->logRequestErrorAuto($e);

                return response()->json([
                'success' => false,
                'message' => 'An error occurred while loading dashboard.'
            ], 500);
        }
    }
}
