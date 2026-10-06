import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname !== "/dashboard.") {
    return NextResponse.next();
  }

  const destination = request.nextUrl.clone();
  destination.pathname = "/dashboard";
  return NextResponse.redirect(destination, 308);
}
