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
        // Add indexes for better query performance
        
        // Products table indexes
        Schema::table('products', function (Blueprint $table) {
            $table->index('created_at', 'products_created_at_index');
            $table->index('updated_at', 'products_updated_at_index');
            $table->index('slug', 'products_slug_index');
        });

        // Categories table indexes
        Schema::table('categories', function (Blueprint $table) {
            $table->index('name', 'categories_name_index');
            $table->index('is_accessory', 'categories_is_accessory_index');
        });

        // Product images table indexes
        Schema::table('product_images', function (Blueprint $table) {
            $table->index(['product_id', 'image_type'], 'product_images_product_type_index');
            $table->index(['product_id', 'sort_order'], 'product_images_product_sort_index');
            $table->index('image_type', 'product_images_type_index');
            $table->index('sort_order', 'product_images_sort_index');
        });

        // Unit types table indexes
        Schema::table('unit_types', function (Blueprint $table) {
            $table->index(['product_id', 'is_default'], 'unit_types_product_default_index');
            $table->index('is_default', 'unit_types_default_index');
        });

        // Category product pivot table indexes
        Schema::table('category_product', function (Blueprint $table) {
            $table->index('category_id', 'category_product_category_index');
            $table->index('product_id', 'category_product_product_index');
        });

        // Videos table indexes (if exists)
        if (Schema::hasTable('videos')) {
            Schema::table('videos', function (Blueprint $table) {
                $table->index(['is_active', 'sort_order'], 'videos_active_sort_index');
                $table->index('is_active', 'videos_active_index');
                $table->index('sort_order', 'videos_sort_index');
            });
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
