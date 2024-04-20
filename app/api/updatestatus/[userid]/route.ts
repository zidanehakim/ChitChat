import supabase from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function OPTIONS(request: Request) {
  const allowedOrigin = request.headers.get("origin");
  const response = new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin":
        allowedOrigin || "https://www.chitchat-now.xyz",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version",
      "Access-Control-Max-Age": "86400",
    },
  });

  return response;
}

export async function POST(
  req: Request,
  context: { params: { userid: string } }
) {
  const status = await req.json();

  try {
    // Extract data from the request
    const userId = context.params.userid;

    // Update Supabase database
    const { error } = await supabase
      .from("users")
      .update({ online_status: status })
      .eq("auth_id", userId)
      .eq("online_status", !status);

    if (error) {
      throw error;
    }

    return NextResponse.json({ mssg: "Offline set" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ mssg: "Status set error" }, { status: 400 });
  }
}
