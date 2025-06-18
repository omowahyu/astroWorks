<?php

use App\Models\User;

test('login screen can be rendered', function () {
    $response = $this->get('/login');

    $response->assertStatus(200);
});

test('users can authenticate using the login screen', function () {
    $user = User::factory()->create();

    $response = $this->withSession(['_token' => 'test-token'])
        ->post('/login', [
            'email' => $user->email,
            'password' => 'password',
            '_token' => 'test-token',
        ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create();

    $this->withSession(['_token' => 'test-token'])
        ->post('/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
            '_token' => 'test-token',
        ]);

    $this->assertGuest();
});

test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->withSession(['_token' => 'test-token'])
        ->post('/logout', ['_token' => 'test-token']);

    $this->assertGuest();
    $response->assertRedirect('/');
});
