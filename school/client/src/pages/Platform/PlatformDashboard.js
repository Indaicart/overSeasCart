import React from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const PlatformDashboard = () => {
  const { data: platformStats, isLoading } = useQuery('platform-stats', async () => {
    const response = await axios.get('/api/platform/stats');
    return response.data;
  });

  const { data: schools } = useQuery('platform-schools', async () => {
    const response = await axios.get('/api/schools?limit=10');
    return response.data;
  });

  const { data: subscriptions } = useQuery('platform-subscriptions', async () => {
    const response = await axios.get('/api/subscriptions?limit=10');
    return response.data;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Total Schools',
      value: platformStats?.totalSchools || 0,
      icon: BuildingOfficeIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Active Subscriptions',
      value: platformStats?.activeSubscriptions || 0,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Total Revenue',
      value: `$${platformStats?.totalRevenue || 0}`,
      icon: CurrencyDollarIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Total Users',
      value: platformStats?.totalUsers || 0,
      icon: UserGroupIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Platform Dashboard</h1>
        <p className="page-subtitle">
          Manage schools, subscriptions, and platform analytics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statCards.map((stat) => (
          <div key={stat.name} className="stat-card">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="stat-label">{stat.name}</p>
                <p className="stat-value">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Schools and Subscriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Schools */}
        <div className="chart-container">
          <h3 className="chart-title">Recent Schools</h3>
          <div className="space-y-3">
            {schools?.schools?.map((school, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{school.name}</p>
                  <p className="text-sm text-gray-500">{school.email}</p>
                </div>
                <div className="text-right">
                  <span className={`badge ${
                    school.subscriptionStatus === 'active' ? 'badge-success' : 
                    school.subscriptionStatus === 'trial' ? 'badge-warning' : 'badge-danger'
                  }`}>
                    {school.subscriptionStatus}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{school.planType}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription Overview */}
        <div className="chart-container">
          <h3 className="chart-title">Subscription Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Active Subscriptions</span>
              <span className="text-2xl font-bold text-green-600">
                {platformStats?.activeSubscriptions || 0}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ 
                  width: `${platformStats?.totalSchools > 0 
                    ? (platformStats.activeSubscriptions / platformStats.totalSchools) * 100 
                    : 0}%` 
                }}
              ></div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {platformStats?.trialSubscriptions || 0}
                </p>
                <p className="text-sm text-gray-500">Trial</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {platformStats?.inactiveSubscriptions || 0}
                </p>
                <p className="text-sm text-gray-500">Inactive</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Distribution */}
      <div className="chart-container">
        <h3 className="chart-title">Plan Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {platformStats?.planDistribution?.map((plan, index) => (
            <div key={index} className="text-center">
              <div className="h-16 w-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 font-bold text-lg">
                  {plan.count}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900 capitalize">{plan.plan}</p>
              <p className="text-xs text-gray-500">{plan.percentage}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="chart-container">
        <h3 className="chart-title">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="btn btn-primary">
            Add New School
          </button>
          <button className="btn btn-secondary">
            View All Schools
          </button>
          <button className="btn btn-secondary">
            Manage Subscriptions
          </button>
          <button className="btn btn-secondary">
            Platform Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlatformDashboard;
