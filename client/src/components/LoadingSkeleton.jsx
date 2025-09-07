import React from 'react';
import { motion } from 'framer-motion';

// Individual card skeleton
const DocumentCardSkeleton = ({ viewMode = 'grid' }) => (
    <div className={`bg-gray-800 rounded-lg p-6 animate-pulse ${
        viewMode === 'list' ? 'flex items-center justify-between' : ''
    }`}>
        <div className={`flex items-center gap-3 ${viewMode === 'list' ? 'flex-1' : 'w-full'}`}>
            {/* Icon skeleton */}
            <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
            
            <div className={`${viewMode === 'list' ? 'flex-1' : 'flex-1'}`}>
                {/* Title skeleton */}
                <div className="h-4 bg-gray-700 rounded mb-2 w-3/4"></div>
                {/* Description skeleton */}
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
            </div>
        </div>
        
        {viewMode === 'grid' && (
            <div className="mt-4 flex justify-between items-center">
                {/* Date skeleton */}
                <div className="h-3 bg-gray-700 rounded w-24"></div>
                {/* File size skeleton */}
                <div className="h-3 bg-gray-700 rounded w-16"></div>
            </div>
        )}
        
        {viewMode === 'list' && (
            <div className="flex items-center gap-4">
                {/* Date skeleton */}
                <div className="h-3 bg-gray-700 rounded w-20"></div>
                {/* File size skeleton */}
                <div className="h-3 bg-gray-700 rounded w-16"></div>
                {/* Action buttons skeleton */}
                <div className="flex gap-2">
                    <div className="w-6 h-6 bg-gray-700 rounded"></div>
                    <div className="w-6 h-6 bg-gray-700 rounded"></div>
                </div>
            </div>
        )}
    </div>
);

// Grid of skeleton cards with loading message
const DocumentGridSkeleton = ({ viewMode = 'grid', count = 8 }) => (
    <div>
        {/* Loading message */}
        <div className="flex items-center justify-center py-4 mb-6">
            <div className="flex items-center gap-3 text-gray-400">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                <span className="text-sm">Loading your documents...</span>
            </div>
        </div>
        
        {/* Skeleton grid */}
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {Array.from({ length: count }).map((_, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <DocumentCardSkeleton viewMode={viewMode} />
                </motion.div>
            ))}
        </div>
    </div>
);

// Analytics cards skeleton with loading message
const AnalyticsCardsSkeleton = () => (
    <div className="mb-8">
        {/* Loading message */}
        <div className="flex items-center justify-center py-2 mb-4">
            <div className="flex items-center gap-3 text-gray-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-sm">Loading analytics...</span>
            </div>
        </div>
        
        {/* Skeleton cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-800 rounded-lg p-6 animate-pulse"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            {/* Label skeleton */}
                            <div className="h-3 bg-gray-700 rounded mb-2 w-20"></div>
                            {/* Value skeleton */}
                            <div className="h-8 bg-gray-700 rounded w-16"></div>
                        </div>
                        {/* Icon skeleton */}
                        <div className="w-6 h-6 bg-gray-700 rounded"></div>
                    </div>
                </motion.div>
            ))}
        </div>
    </div>
);

// Toolbar skeleton
const ToolbarSkeleton = () => (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4 flex-1">
            {/* Search bar skeleton */}
            <div className="h-10 bg-gray-800 rounded-lg flex-1 max-w-md animate-pulse"></div>
            {/* Filter button skeleton */}
            <div className="h-10 w-10 bg-gray-800 rounded-lg animate-pulse"></div>
        </div>
        
        <div className="flex items-center gap-4">
            {/* View mode buttons skeleton */}
            <div className="flex gap-2">
                <div className="h-10 w-10 bg-gray-800 rounded-lg animate-pulse"></div>
                <div className="h-10 w-10 bg-gray-800 rounded-lg animate-pulse"></div>
            </div>
            {/* Create button skeleton */}
            <div className="h-10 w-32 bg-gray-800 rounded-lg animate-pulse"></div>
        </div>
    </div>
);

// Complete dashboard loading state
const DashboardLoadingSkeleton = ({ viewMode = 'grid' }) => (
    <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
            {/* Header skeleton */}
            <div className="mb-8">
                <div className="h-8 bg-gray-800 rounded w-48 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-800 rounded w-64 animate-pulse"></div>
            </div>

            {/* Analytics skeleton */}
            <AnalyticsCardsSkeleton />

            {/* Toolbar skeleton */}
            <ToolbarSkeleton />

            {/* Content skeleton */}
            <DocumentGridSkeleton viewMode={viewMode} count={8} />
        </div>
    </div>
);

export { 
    DocumentCardSkeleton, 
    DocumentGridSkeleton, 
    AnalyticsCardsSkeleton, 
    ToolbarSkeleton,
    DashboardLoadingSkeleton 
};
