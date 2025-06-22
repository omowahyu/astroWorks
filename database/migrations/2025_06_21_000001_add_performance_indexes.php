<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add indexes for products table
        try {
            Schema::table('products', function (Blueprint $table) {
                // Index for slug lookups (very common)
                $table->index('slug', 'products_slug_index');
                // Index for name searches
                $table->index('name', 'products_name_index');
                // Index for created_at (for sorting)
                $table->index('created_at', 'products_created_at_index');
                // Index for deleted_at (for soft deletes)
                $table->index('deleted_at', 'products_deleted_at_index');
            });
        } catch (\Exception $e) {
            // Indexes might already exist, ignore
        }

        // Add indexes for product_images table
        try {
            Schema::table('product_images', function (Blueprint $table) {
                // Index for product_id (foreign key)
                $table->index('product_id', 'product_images_product_id_index');
                // Composite index for image type and device type filtering
                $table->index(['image_type', 'device_type'], 'product_images_type_device_index');
                // Composite index for product_id and image_type (common query pattern)
                $table->index(['product_id', 'image_type'], 'product_images_product_type_index');
                // Index for sort_order
                $table->index('sort_order', 'product_images_sort_order_index');
                // Composite index for product_id, device_type, and sort_order (for ordering)
                $table->index(['product_id', 'device_type', 'sort_order'], 'product_images_product_device_sort_index');
            });
        } catch (\Exception $e) {
            // Indexes might already exist, ignore
        }

        // Add indexes for categories table
        if (Schema::hasTable('categories')) {
            try {
                Schema::table('categories', function (Blueprint $table) {
                    // Index for is_accessory flag
                    $table->index('is_accessory', 'categories_is_accessory_index');
                    // Index for name searches
                    $table->index('name', 'categories_name_index');
                });
            } catch (\Exception $e) {
                // Indexes might already exist, ignore
            }
        }

        // Add indexes for category_product pivot table
        if (Schema::hasTable('category_product')) {
            try {
                Schema::table('category_product', function (Blueprint $table) {
                    // Index for category_id
                    $table->index('category_id', 'category_product_category_id_index');
                    // Index for product_id
                    $table->index('product_id', 'category_product_product_id_index');
                    // Unique composite index
                    $table->unique(['category_id', 'product_id'], 'category_product_unique_index');
                });
            } catch (\Exception $e) {
                // Indexes might already exist, ignore
            }
        }

        // Add indexes for unit_types table
        if (Schema::hasTable('unit_types')) {
            try {
                Schema::table('unit_types', function (Blueprint $table) {
                    // Index for product_id (foreign key)
                    $table->index('product_id', 'unit_types_product_id_index');
                    // Index for is_default flag
                    $table->index('is_default', 'unit_types_is_default_index');
                    // Composite index for product_id and is_default (for finding default unit type)
                    $table->index(['product_id', 'is_default'], 'unit_types_product_default_index');
                });
            } catch (\Exception $e) {
                // Indexes might already exist, ignore
            }
        }

        // Add indexes for product_misc_options table
        if (Schema::hasTable('product_misc_options')) {
            try {
                Schema::table('product_misc_options', function (Blueprint $table) {
                    // Index for product_id (foreign key)
                    $table->index('product_id', 'product_misc_options_product_id_index');
                    // Index for is_default flag
                    $table->index('is_default', 'product_misc_options_is_default_index');
                });
            } catch (\Exception $e) {
                // Indexes might already exist, ignore
            }
        }

        // Add indexes for transactions table
        if (Schema::hasTable('transactions')) {
            try {
                Schema::table('transactions', function (Blueprint $table) {
                    // Index for created_at (for date-based queries)
                    $table->index('created_at', 'transactions_created_at_index');
                });
            } catch (\Exception $e) {
                // Indexes might already exist, ignore
            }
        }

        // Add indexes for transaction_items table
        if (Schema::hasTable('transaction_items')) {
            try {
                Schema::table('transaction_items', function (Blueprint $table) {
                    // Index for transaction_id (foreign key)
                    $table->index('transaction_id', 'transaction_items_transaction_id_index');
                    // Index for product_id (foreign key)
                    $table->index('product_id', 'transaction_items_product_id_index');
                });
            } catch (\Exception $e) {
                // Indexes might already exist, ignore
            }
        }

        // Add indexes for videos table
        if (Schema::hasTable('videos')) {
            try {
                Schema::table('videos', function (Blueprint $table) {
                    // Index for is_active flag
                    $table->index('is_active', 'videos_is_active_index');
                    // Index for sort_order
                    $table->index('sort_order', 'videos_sort_order_index');
                });
            } catch (\Exception $e) {
                // Indexes might already exist, ignore
            }
        }

        // Add indexes for users table
        try {
            Schema::table('users', function (Blueprint $table) {
                // Index for email_verified_at
                $table->index('email_verified_at', 'users_email_verified_at_index');
            });
        } catch (\Exception $e) {
            // Index might already exist, ignore
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop indexes in reverse order
        
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('users_email_verified_at_index');
        });

        if (Schema::hasTable('videos')) {
            Schema::table('videos', function (Blueprint $table) {
                $table->dropIndex('videos_sort_order_index');
                $table->dropIndex('videos_is_active_index');
            });
        }

        if (Schema::hasTable('transaction_items')) {
            Schema::table('transaction_items', function (Blueprint $table) {
                $table->dropIndex('transaction_items_product_id_index');
                $table->dropIndex('transaction_items_transaction_id_index');
            });
        }

        if (Schema::hasTable('transactions')) {
            Schema::table('transactions', function (Blueprint $table) {
                $table->dropIndex('transactions_created_at_index');
            });
        }

        if (Schema::hasTable('product_misc_options')) {
            Schema::table('product_misc_options', function (Blueprint $table) {
                $table->dropIndex('product_misc_options_is_default_index');
                $table->dropIndex('product_misc_options_product_id_index');
            });
        }

        if (Schema::hasTable('unit_types')) {
            Schema::table('unit_types', function (Blueprint $table) {
                $table->dropIndex('unit_types_product_default_index');
                $table->dropIndex('unit_types_is_default_index');
                $table->dropIndex('unit_types_product_id_index');
            });
        }

        if (Schema::hasTable('category_product')) {
            Schema::table('category_product', function (Blueprint $table) {
                $table->dropUnique('category_product_unique_index');
                $table->dropIndex('category_product_product_id_index');
                $table->dropIndex('category_product_category_id_index');
            });
        }

        Schema::table('categories', function (Blueprint $table) {
            $table->dropIndex('categories_name_index');
            $table->dropIndex('categories_is_accessory_index');
        });

        Schema::table('product_images', function (Blueprint $table) {
            $table->dropIndex('product_images_product_device_sort_index');
            $table->dropIndex('product_images_sort_order_index');
            $table->dropIndex('product_images_product_type_index');
            $table->dropIndex('product_images_type_device_index');
            $table->dropIndex('product_images_product_id_index');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('products_deleted_at_index');
            $table->dropIndex('products_created_at_index');
            $table->dropIndex('products_name_index');
            $table->dropIndex('products_slug_index');
        });
    }


};
