import { NextResponse } from "next/server";
import os from "os";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  // Get the current user's home directory
  const homeDir = os.homedir();

  // Construct the full path to the Downloads directory
  const downloadDir = path.join(homeDir, "Downloads");

  try {
    const fileName = await req.json();
    const filePath = path.join(downloadDir, fileName);

    if (fs.existsSync(filePath)) {
      // Read the file as a Buffer
      const data = fs.readFileSync(filePath);

      // Send the file content in the response
      return new NextResponse(data, { status: 200 });
    } else {
      // Send the file content in the response
      return new NextResponse({} as File, { status: 400 });
    }
  } catch (error) {
    return new NextResponse({} as File, { status: 400 });
  }
}
