<?php

test('registration screen is disabled for security', function () {
    $response = $this->get('/register');

    // Registration is disabled for production security
    $response->assertStatus(404);
});

test('registration endpoint is disabled for security', function () {
    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    // Registration is disabled for production security
    $response->assertStatus(404);
    $this->assertGuest();
});
