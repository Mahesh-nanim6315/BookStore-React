import React from 'react'

const AdminLayoutsNavbar = () => {
  return (
    <div className="page">
{/*  */}
    $unreadCount = auth()->check() ? auth()->user()->unreadNotifications->count() : 0;
    $userName = auth()->check() ? auth()->user()->name : 'Admin';
    $userInitial = strtoupper(substr($userName, 0, 1));
{/*  */}

<nav className="topbar" aria-label="Admin top navigation">
    <div className="topbar-left">
        <button id="mobileSidebarToggle" className="icon-btn mobile-sidebar-btn" type="button" aria-label="Open sidebar">
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 6h18M3 12h18M3 18h18" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2"></path>
            </svg>
        </button>

        <div>
            <h2 id="dash" className="page-title">Admin Dashboard</h2>
            <p className="page-subtitle">Manage catalog, orders, and operations</p>
        </div>
    </div>

    <div className="topbar-right">
        <button id="themeToggle" className="icon-btn theme-btn" type="button" aria-label="Enable dark mode" aria-pressed="false">
            <svg className="icon-moon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.7 14.1A9 9 0 0 1 9.9 3.3a9 9 0 1 0 10.8 10.8z"></path>
            </svg>
            <svg className="icon-sun" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 17a5 5 0 1 1 5-5 5 5 0 0 1-5 5zm0-14v3m0 12v3M4.2 4.2l2.1 2.1m11.4 11.4l2.1 2.1M3 12h3m12 0h3M4.2 19.8l2.1-2.1m11.4-11.4l2.1-2.1" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2"></path>
            </svg>
        </button>
{/* 
         */}
            <div className="notify-dropdown">
                <button id="notifyToggle" className="icon-btn notify-trigger" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="notifyMenu">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22zm7-6V11a7 7 0 1 0-14 0v5l-2 2v1h18v-1l-2-2z"></path>
                    </svg>
{/*                      */}
                        <span className="badge"></span>
{/*                      */}
                </button>

                <ul id="notifyMenu" className="topbar-dropdown notify-menu" hidden>
{/*                     ->user()->notifications->take(5) as $notification) */}
                        <li>
                            <a href=""
                               className="">
                                
                            </a>
                        </li>
{/*                      */}
                        <li className="empty">No notifications</li>
{/*                      */}

                    <li className="divider"></li>
                    <li>
                        <a href="" className="view-all">View all notifications</a>
                    </li>
                </ul>
            </div>
{/*          */}

        <div className="user-chip" title="">
            <span className="avatar"></span>
            <span className="username"></span>
        </div>

        <form method="POST" action="">
{/*              */}
            <button type="submit" className="logout-btn">Logout</button>
        </form>
    </div>
</nav>


    </div>
  )
}

export default AdminLayoutsNavbar







