<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('product_images', function (Blueprint $table) {
            // Check and add columns if they don't exist
            if (! Schema::hasColumn('product_images', 'image_type')) {
                $table->enum('image_type', ['thumbnail', 'gallery', 'hero'])->default('gallery')->after('image_path');
            }

            if (! Schema::hasColumn('product_images', 'is_thumbnail')) {
                $table->boolean('is_thumbnail')->default(false)->after('image_type');
            }

            if (! Schema::hasColumn('product_images', 'display_order')) {
                $table->integer('display_order')->default(0)->after('is_thumbnail');
            }
        });

        // Update existing data
        DB::table('product_images')->update([
            'image_type' => 'gallery',
            'is_thumbnail' => false,
            'display_order' => DB::raw('COALESCE(sort_order, 0)'),
        ]);

        // Set the first image of each product as thumbnail
        $products = DB::table('products')->get();

        foreach ($products as $product) {
            $firstImage = DB::table('product_images')
                ->where('product_id', $product->id)
                ->orderBy('sort_order')
                ->orderBy('created_at')
                ->first();

            if ($firstImage) {
                DB::table('product_images')
                    ->where('id', $firstImage->id)
                    ->update([
                        'image_type' => 'thumbnail',
                        'is_thumbnail' => true,
                    ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_images', function (Blueprint $table) {
            if (Schema::hasColumn('product_images', 'image_type')) {
                $table->dropColumn('image_type');
            }

            if (Schema::hasColumn('product_images', 'is_thumbnail')) {
                $table->dropColumn('is_thumbnail');
            }

            if (Schema::hasColumn('product_images', 'display_order')) {
                $table->dropColumn('display_order');
            }
        });
    }
};
