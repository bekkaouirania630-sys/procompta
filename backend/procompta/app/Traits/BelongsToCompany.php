<?php

namespace App\Traits;

use App\Models\Company;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Config;

trait BelongsToCompany
{
    protected static function bootBelongsToCompany()
    {
        static::creating(function ($model) {
            if (!$model->company_id && Config::get('app.current_company_id')) {
                $model->company_id = Config::get('app.current_company_id');
            }
        });

        static::addGlobalScope('company', function (Builder $builder) {
            if (Config::get('app.current_company_id')) {
                $builder->where($builder->getQuery()->from . '.company_id', Config::get('app.current_company_id'));
            }
        });
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
