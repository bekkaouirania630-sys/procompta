<?php

namespace App\Repositories\Contracts;

interface BaseRepositoryInterface
{
    public function all();
    public function paginate($perPage = 15);
    public function find($id);
    public function findBy($field, $value);
    public function create(array $data);
    public function update($id, array $data);
    public function delete($id);
}
