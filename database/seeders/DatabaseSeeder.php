<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'id' => 1,
            'name' => 'davinci',
            'username' => 'davinci',
            'email' => 'rojangalang12@gmail.com',
            'password' => '$2y$10$irllJoOoYP9wuAQHsZjFmOZzpGLc0jZt3QRYmGLh6fF/MmHoF0xNe',
            'role' => 'admin',
            'status' => 'active',
            'created_at' => '2026-07-18 04:03:28',
        ]);

        User::create([
            'id' => 2,
            'name' => 'vncrjn',
            'username' => 'vncrjn',
            'email' => 'exjanro@gmail.com',
            'password' => '$2y$10$XRK0mdmu5/zqqme8Tvbf.e5ls81PJNidQmZ/2dObKdDaChTuikhM.',
            'role' => 'user',
            'status' => 'active',
            'created_at' => '2026-07-18 06:15:15',
        ]);

        User::create([
            'id' => 3,
            'name' => 'dqsjnr',
            'username' => 'dqsjnr',
            'email' => 'gagokaba@email.com',
            'password' => '$2y$10$cJSiugF.2WkmtttqLVLq3.mrLatWQJjPo1sYMcwMfMG4S3hzxvfMa',
            'role' => 'user',
            'status' => 'active',
            'created_at' => '2026-07-18 07:46:30',
        ]);
    }
}