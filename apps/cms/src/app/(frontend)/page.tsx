import Link from "next/link"

export default function Home() {
  return (
    <main>
      <h1>FORMA CMS</h1>
      <p>
        Content is managed in the <Link href="/admin">Payload admin</Link>.
      </p>
    </main>
  )
}
