import Image from "next/image"
import Link from "next/link"

// Coloca tu imagen en /public/illustrations/ (p.ej. /public/illustrations/404-cat.png)
const ILLUSTRATION_SRC = "/illustrations/404-cat.png"

export default function NotFound() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#fcb82f] text-[#4b2659] px-4">
      <section className="px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-16 sm:pb-24 text-center">
        {/* Title */}
        <h1 className="mx-auto max-w-3xl text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight leading-[1.1]">
          The Page You Requested Could Not Be Found
        </h1>

        {/* Illustration on a soft blob */}
        <div className="relative mx-auto mt-8 sm:mt-10 w-full max-w-sm sm:max-w-md md:max-w-lg">

          {/* your external artwork */}
          <div className="relative mx-auto aspect-[4/3] w-full">
            <Image
              src={ILLUSTRATION_SRC}
              alt="404 error illustration"
              fill
              priority
              className="object-contain"
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 70vw, 640px"
            />
          </div>
        </div>

        {/* Copy */}
        <p className="mx-auto mt-8 sm:mt-10 max-w-2xl text-base sm:text-lg md:text-xl text-[#4b2659] font-semibold">
          We searched high and low but couldn’t find what you’re looking for. Let’s find a better place for you to go.
        </p>

        {/* CTA */}
        <div className="mt-8 sm:mt-10">
          <Link
            href="/"
            className="inline-flex w-full sm:w-auto items-center justify-center rounded-full bg-[#e4640b] px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 text-white text-base sm:text-lg font-bold tracking-wide hover:bg-[#4b2659] focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-[#fcb82f]"
          >
            GO TO HOMEPAGE
          </Link>
        </div>
      </section>
    </main>
  )
}
