This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Producción con Vercel, Neon y Cloudinary

1. Subí este proyecto a GitHub. `.env` está excluido por `.gitignore`.
2. Importá el repositorio en Vercel con el plan Hobby.
3. Configurá estas variables en Vercel:
	- `DATABASE_URL`: connection string pooled de Neon.
	- `AUTH_SECRET`: secreto largo y aleatorio.
	- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`: Cloud name de Cloudinary.
	- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`: preset unsigned de imágenes.
4. Desde una terminal local con `DATABASE_URL` de producción ejecutá `npm run db:push` y `npm run db:seed`.
5. Promové tu usuario a administrador ejecutando en Neon:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'tu-email@example.com';
```

6. Verificá en producción registro, login, carga de imágenes, reservas, comprobantes y el panel `/admin`.

No publiques valores reales de `.env` ni reutilices credenciales que hayan sido compartidas en conversaciones o capturas.
