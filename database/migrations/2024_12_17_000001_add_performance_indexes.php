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
        // Add indexes for better query performance - only if tables exist

        // Products table indexes
        if (Schema::hasTable('products')) {
            Schema::table('products', function (Blueprint $table) {
                if (!$this->indexExists('products', 'products_created_at_index')) {
                    $table->index('created_at', 'products_created_at_index');
                }
                if (!$this->indexExists('products', 'products_updated_at_index')) {
                    $table->index('updated_at', 'products_updated_at_index');
                }
                if (!$this->indexExists('products', 'products_slug_index')) {
                    $table->index('slug', 'products_slug_index');
                }
            });
        }

        // Categories table indexes
        if (Schema::hasTable('categories')) {
            Schema::table('categories', function (Blueprint $table) {
                if (!$this->indexExists('categories', 'categories_name_index')) {
                    $table->index('name', 'categories_name_index');
                }
                if (!$this->indexExists('categories', 'categories_is_accessory_index')) {
                    $table->index('is_accessory', 'categories_is_accessory_index');
                }
            });
        }

        // Product images table indexes
        if (Schema::hasTable('product_images')) {
            Schema::table('product_images', function (Blueprint $table) {
                if (!$this->indexExists('product_images', 'product_images_product_type_index')) {
                    $table->index(['product_id', 'image_type'], 'product_images_product_type_index');
                }
                if (!$this->indexExists('product_images', 'product_images_product_sort_index')) {
                    $table->index(['product_id', 'sort_order'], 'product_images_product_sort_index');
                }
                if (!$this->indexExists('product_images', 'product_images_type_index')) {
                    $table->index('image_type', 'product_images_type_index');
                }
                if (!$this->indexExists('product_images', 'product_images_sort_index')) {
                    $table->index('sort_order', 'product_images_sort_index');
                }
            });
        }

        // Unit types table indexes
        if (Schema::hasTable('unit_types')) {
            Schema::table('unit_types', function (Blueprint $table) {
                if (!$this->indexExists('unit_types', 'unit_types_product_default_index')) {
                    $table->index(['product_id', 'is_default'], 'unit_types_product_default_index');
                }
                if (!$this->indexExists('unit_types', 'unit_types_default_index')) {
                    $table->index('is_default', 'unit_types_default_index');
                }
            });
        }

        // Category product pivot table indexes
        if (Schema::hasTable('category_product')) {
            Schema::table('category_product', function (Blueprint $table) {
                if (!$this->indexExists('category_product', 'category_product_category_index')) {
                    $table->index('category_id', 'category_product_category_index');
                }
                if (!$this->indexExists('category_product', 'category_product_product_index')) {
                    $table->index('product_id', 'category_product_product_index');
                }
            });
        }

        // Videos table indexes (if exists)
        if (Schema::hasTable('videos')) {
            Schema::table('videos', function (Blueprint $table) {
                if (!$this->indexExists('videos', 'videos_active_sort_index')) {
                    $table->index(['is_active', 'sort_order'], 'videos_active_sort_index');
                }
                if (!$this->indexExists('videos', 'videos_active_index')) {
                    $table->index('is_active', 'videos_active_index');
                }
                if (!$this->indexExists('videos', 'videos_sort_index')) {
                    $table->index('sort_order', 'videos_sort_index');
                }
            });
        }
    }

    /**
     * Check if index exists on table
     */
    private function indexExists(string $table, string $index): bool
    {
        try {
            $indexes = \DB::select("SHOW INDEX FROM `{$table}` WHERE Key_name = '{$index}'");
            return count($indexes) > 0;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop indexes in reverse order
        
        if (Schema::hasTable('videos')) {
            Schema::table('videos', function (Blueprint $table) {
                $table->dropIndex('videos_active_sort_index');
                $table->dropIndex('videos_active_index');
                $table->dropIndex('videos_sort_index');
            });
        }

        Schema::table('category_product', function (Blueprint $table) {
            $table->dropIndex('category_product_category_index');
            $table->dropIndex('category_product_product_index');
        });

        Schema::table('unit_types', function (Blueprint $table) {
            $table->dropIndex('unit_types_product_default_index');
            $table->dropIndex('unit_types_default_index');
        });

        Schema::table('product_images', function (Blueprint $table) {
            $table->dropIndex('product_images_product_type_index');
            $table->dropIndex('product_images_product_sort_index');
            $table->dropIndex('product_images_type_index');
            $table->dropIndex('product_images_sort_index');
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropIndex('categories_name_index');
            $table->dropIndex('categories_is_accessory_index');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('products_created_at_index');
            $table->dropIndex('products_updated_at_index');
            $table->dropIndex('products_slug_index');
        });
    }
};
