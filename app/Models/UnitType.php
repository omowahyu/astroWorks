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
 * @property string $price
 * @property bool $is_default
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Category> $categories
 * @property-read int|null $categories_count
 * @property-read \App\Models\Product $product
 * @method static \Database\Factories\UnitTypeFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnitType newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnitType newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnitType onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnitType query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnitType whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnitType whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnitType whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnitType whereIsDefault($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnitType whereLabel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnitType wherePrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnitType whereProductId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnitType whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnitType withTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnitType withoutTrashed()
 * @mixin \Eloquent
 */
class UnitType extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = ['product_id', 'label', 'price', 'is_default'];


    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<\App\Models\Product>
     */
    public function product(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Product::class);
    }


    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany<\App\Models\Category>
     */
    public function categories(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Category::class);
    }


    protected static function booted(): void
    {
        // pastikan hanya satu default per produk
        static::saving(function ($unit) {
            if ($unit->is_default) {
                static::query()
                    ->where('product_id', $unit->product_id)
                    ->where('id', '!=', $unit->id)
                    ->update(['is_default' => false]);
            }
        });
    }
}
