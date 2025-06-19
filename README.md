Panduan Deployment Aplikasi Laravel Docker

Repository ini berisi konfigurasi lengkap untuk pengembangan dan deployment aplikasi Laravel 12 menggunakan Inertia.js (dengan React), Octane, dan Docker. Konfigurasi ini dioptimalkan untuk production dengan multi-stage builds dan distroless images untuk keamanan dan ukuran yang kecil.
Lingkungan Lokal (Development)

    Clone repository:

    git clone <url-repo-anda>
    cd <nama-repo-anda>

    Buat file .env:

    cp .env.example .env

    Perbarui file .env dengan pengaturan lokal Anda. Pastikan DB_HOST=mysql.

    Build dan jalankan container:

    docker-compose up -d --build

    Install dependensi dan generate key:

    docker-compose exec laravel.app composer install
    docker-compose exec laravel.app php artisan key:generate
    docker-compose exec laravel.app npm install

    Jalankan migrasi database:

    docker-compose exec laravel.app php artisan migrate

    Akses aplikasi:
    Aplikasi Anda akan tersedia di http://localhost.

Deployment ke Produksi (Production)

Deployment ke server produksi diotomatisasi menggunakan GitHub Actions.
Prasyarat

    VPS dengan Docker dan Docker Compose terinstall.

    Kredensial SSH server Anda (host, username, port, private key) sudah disimpan di GitHub Secrets.

    File .env untuk produksi sudah ada di direktori proyek di server Anda.

Proses Deployment

Workflow GitHub Actions di .github/workflows/deploy.yml akan berjalan otomatis setiap kali ada push ke branch production.

    GitHub Actions akan membangun aset frontend (npm run build).

    Seluruh file proyek, termasuk aset yang sudah di-build, akan disalin ke server Anda menggunakan scp.

    GitHub Actions akan menjalankan skrip ./.scripts/deploy.sh di server Anda, yang akan melakukan:

        Membangun ulang image Docker.

        Menjalankan migrasi database.

        Mengoptimasi cache Laravel.

        Me-reload Octane worker tanpa downtime.
