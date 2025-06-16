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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
        Schema::create('unit_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('label'); // ex: "2x3m", "2.4x2.7m", "10.5x20.5m"
            $table->decimal('price', 15, 2);
            $table->boolean('is_default')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });
        Schema::create('product_misc_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('label'); // ex: Tema
            $table->string('value'); // ex: Hitam, Coklat
            $table->boolean('is_default')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->boolean('is_accessory')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });
        Schema::create('category_product', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();
        });
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->text('customer_note')->nullable();
            $table->decimal('total_price', 15, 2);
            $table->timestamps();

        });
        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('image_path');
            $table->string('alt_text')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('transaction_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('unit_type_id')->constrained()->onDelete('cascade'); // jenis ukuran
            $table->integer('quantity');
            $table->decimal('price', 15, 2);
            $table->jsonb('accessories')->nullable(); // hanya untuk yang dari kategori accessories
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('category_product');
    }
};
