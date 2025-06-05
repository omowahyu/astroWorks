<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * 
 *
 * @property int $id
 * @property int $product_id
 * @property string $label
 * @property string $value
 * @property bool $is_default
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \App\Models\Product $product
 * @method static \Database\Factories\ProductMiscOptionFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductMiscOption newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductMiscOption newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductMiscOption onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductMiscOption query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductMiscOption whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductMiscOption whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductMiscOption whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductMiscOption whereIsDefault($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductMiscOption whereLabel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductMiscOption whereProductId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductMiscOption whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductMiscOption whereValue($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductMiscOption withTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductMiscOption withoutTrashed()
 * @mixin \Eloquent
 */
class ProductMiscOption extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = ['product_id', 'label', 'value', 'is_default'];


    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<\App\Models\Product>
     */
    public function product(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Product::class);
    }


    protected static function booted(): void
    {
        static::saving(function ($misc) {
            if ($misc->is_default) {
                static::query()
                    ->where('product_id', $misc->product_id)
                    ->where('label', $misc->label)
                    ->where('id', '!=', $misc->id)
                    ->update(['is_default' => false]);
            }
        });
    }
}
