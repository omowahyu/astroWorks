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
        Schema::table('product_images', function (Blueprint $table) {
            // Only drop columns that actually exist
            $columnsToCheck = [
                'is_thumbnail',
                'mobile_portrait_path',
                'mobile_square_path',
                'desktop_landscape_path',
                'original_file_size',
                'optimized_file_size',
                'image_metadata',
                'is_primary',
                'display_order'
            ];

            $columnsToDrop = [];
            foreach ($columnsToCheck as $column) {
                if (Schema::hasColumn('product_images', $column)) {
                    $columnsToDrop[] = $column;
                }
            }

            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_images', function (Blueprint $table) {
            // Restore columns if needed - only add columns that don't already exist
            if (!Schema::hasColumn('product_images', 'mobile_portrait_path')) {
                $table->string('mobile_portrait_path')->nullable()->after('image_path');
            }
            if (!Schema::hasColumn('product_images', 'mobile_square_path')) {
                $table->string('mobile_square_path')->nullable()->after('mobile_portrait_path');
            }
            if (!Schema::hasColumn('product_images', 'desktop_landscape_path')) {
                $table->string('desktop_landscape_path')->nullable()->after('mobile_square_path');
            }
            if (!Schema::hasColumn('product_images', 'original_file_size')) {
                $table->bigInteger('original_file_size')->nullable()->after('desktop_landscape_path');
            }
            if (!Schema::hasColumn('product_images', 'optimized_file_size')) {
                $table->bigInteger('optimized_file_size')->nullable()->after('original_file_size');
            }
            if (!Schema::hasColumn('product_images', 'image_metadata')) {
                $table->json('image_metadata')->nullable()->after('optimized_file_size');
            }
            if (!Schema::hasColumn('product_images', 'is_thumbnail')) {
                $table->boolean('is_thumbnail')->default(false)->after('image_type');
            }
            if (!Schema::hasColumn('product_images', 'is_primary')) {
                $table->boolean('is_primary')->default(false)->after('alt_text');
            }
            if (!Schema::hasColumn('product_images', 'display_order')) {
                $table->integer('display_order')->default(0)->after('is_thumbnail');
            }
        });
    }
};
