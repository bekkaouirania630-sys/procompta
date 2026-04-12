<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

trait Multitenantable
{
    public static function bootMultitenantable()
    {
        if (Auth::check()) {
            static::creating(function ($model) {
                if (!$model->company_id) {
                    $model->company_id = Auth::user()->company_id;
                }
            });

            static::addGlobalScope('company_id', function (Builder $builder) {
                if (Auth::check() && Auth::user()->company_id) {
                    $builder->where('company_id', Auth::user()->company_id);
                }
            });
        }
    }
}
