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
        Schema::create('payment_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value');
            $table->string('type')->default('string'); // string, text, number
            $table->string('group')->default('general'); // general, bank, whatsapp
            $table->string('label');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Insert default settings
        DB::table('payment_settings')->insert([
            [
                'key' => 'whatsapp_number',
                'value' => '62822222137',
                'type' => 'string',
                'group' => 'whatsapp',
                'label' => 'Nomor WhatsApp',
                'description' => 'Nomor WhatsApp untuk checkout (format: 628xxxxxxxxx)',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'key' => 'whatsapp_message_template',
                'value' => "Halo, saya ingin memesan:\n\n{order_details}\n\nTOTAL KESELURUHAN: {total}\n\nMohon konfirmasi ketersediaan dan total pembayaran. Terima kasih!",
                'type' => 'text',
                'group' => 'whatsapp',
                'label' => 'Template Pesan WhatsApp',
                'description' => 'Template pesan WhatsApp. Gunakan {order_details} dan {total} sebagai placeholder.',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'key' => 'bank_name',
                'value' => 'BCA',
                'type' => 'string',
                'group' => 'bank',
                'label' => 'Nama Bank',
                'description' => 'Nama bank untuk transfer',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'key' => 'bank_account_name',
                'value' => 'Astro Works Indonesia PT',
                'type' => 'string',
                'group' => 'bank',
                'label' => 'Nama Pemilik Rekening',
                'description' => 'Nama pemilik rekening bank',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'key' => 'bank_account_number',
                'value' => '7025899002',
                'type' => 'string',
                'group' => 'bank',
                'label' => 'Nomor Rekening',
                'description' => 'Nomor rekening bank',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_settings');
    }
};
