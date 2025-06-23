<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $transaction_id
 * @property int $product_id
 * @property int $unit_type_id
 * @property int $quantity
 * @property string $price
 * @property array<array-key, mixed>|null $accessories
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Product $product
 * @property-read \App\Models\Transaction $transaction
 * @property-read \App\Models\UnitType $unitType
 *
 * @method static \Database\Factories\TransactionItemFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionItem whereAccessories($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionItem wherePrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionItem whereProductId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionItem whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionItem whereTransactionId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionItem whereUnitTypeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionItem whereUpdatedAt($value)
 *
 * @mixin \Eloquent
 */
class TransactionItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id',
        'product_id',
        'unit_type_id',
        'quantity',
        'price',
        'accessories',
    ];

    protected $casts = [
        'accessories' => 'array',
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<\App\Models\Product>
     */
    public function transaction(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<\App\Models\Product>
     */
    public function product(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<\App\Models\Product>
     */
    public function unitType(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(UnitType::class);
    }
}
