<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;
use Illuminate\Database\Eloquent\Model;

trait Auditable
{
    protected static function bootAuditable()
    {
        static::created(function (Model $model) {
            $model->logAudit('created', null, $model->getAttributes());
        });

        static::updated(function (Model $model) {
            $oldValues = array_intersect_key($model->getOriginal(), $model->getChanges());
            $newValues = $model->getChanges();
            
            // Don't log if only timestamps changed
            unset($oldValues['updated_at'], $newValues['updated_at']);
            
            if (empty($newValues)) return;

            $model->logAudit('updated', $oldValues, $newValues);
        });

        static::deleted(function (Model $model) {
            $model->logAudit('deleted', $model->getAttributes(), null);
        });
    }

    protected function logAudit(string $event, ?array $old, ?array $new)
    {
        AuditLog::create([
            'user_id' => Auth::id(),
            'company_id' => $this->company_id ?? Config::get('app.current_company_id'),
            'event' => $event,
            'auditable_type' => get_class($this),
            'auditable_id' => $this->id,
            'old_values' => $old,
            'new_values' => $new,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
