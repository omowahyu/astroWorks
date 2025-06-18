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
            $table->enum('device_type', ['mobile', 'desktop'])->default('desktop')->after('image_type');
            $table->decimal('aspect_ratio', 4, 2)->nullable()->after('device_type');
            $table->json('image_dimensions')->nullable()->after('aspect_ratio');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_images', function (Blueprint $table) {
            $table->dropColumn(['device_type', 'aspect_ratio', 'image_dimensions']);
        });
    }
};
