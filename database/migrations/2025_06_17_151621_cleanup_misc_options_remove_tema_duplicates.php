<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Update all 'Tema' labels to 'Warna'
        DB::table('product_misc_options')
            ->where('label', 'Tema')
            ->update(['label' => 'Warna']);

        // 2. Update all 'Color' labels to 'Warna'
        DB::table('product_misc_options')
            ->where('label', 'Color')
            ->update(['label' => 'Warna']);

        // 3. Update all 'Finish' labels to 'Warna' (consolidate everything)
        DB::table('product_misc_options')
            ->where('label', 'Finish')
            ->update(['label' => 'Warna']);

        // 4. Remove duplicate values for same product_id and label
        $duplicates = DB::table('product_misc_options')
            ->select('product_id', 'label', 'value', DB::raw('COUNT(*) as count'), DB::raw('MIN(id) as keep_id'))
            ->groupBy('product_id', 'label', 'value')
            ->having('count', '>', 1)
            ->get();

        foreach ($duplicates as $duplicate) {
            // Keep the first one, delete the rest
            DB::table('product_misc_options')
                ->where('product_id', $duplicate->product_id)
                ->where('label', $duplicate->label)
                ->where('value', $duplicate->value)
                ->where('id', '!=', $duplicate->keep_id)
                ->delete();
        }

        // 5. Ensure only one default per product per label
        $products = DB::table('product_misc_options')
            ->select('product_id', 'label')
            ->groupBy('product_id', 'label')
            ->get();

        foreach ($products as $product) {
            // Reset all to non-default first
            DB::table('product_misc_options')
                ->where('product_id', $product->product_id)
                ->where('label', $product->label)
                ->update(['is_default' => false]);

            // Set first one as default
            $firstOption = DB::table('product_misc_options')
                ->where('product_id', $product->product_id)
                ->where('label', $product->label)
                ->orderBy('id')
                ->first();

            if ($firstOption) {
                DB::table('product_misc_options')
                    ->where('id', $firstOption->id)
                    ->update(['is_default' => true]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Cannot reliably reverse this cleanup
        // Would need to restore original data from backup
    }
};
