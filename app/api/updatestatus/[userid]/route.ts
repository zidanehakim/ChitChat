import supabase from "@/utils/supabase/server";
import { NextResponse } from "next/server";

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
