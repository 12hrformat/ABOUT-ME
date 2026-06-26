export default async function handler(req, res) {
    try {
        // Get visitor IP
        const forwarded = req.headers["x-forwarded-for"];
        let ip = forwarded
            ? forwarded.split(",")[0].trim()
            : req.socket?.remoteAddress || "Unknown";

        // Clean IPv6-mapped IPv4
        if (ip.startsWith("::ffff:")) {
            ip = ip.replace("::ffff:", "");
        }

        // Default geo data
        let geoData = {
            city: "Unknown",
            region: "Unknown",
            country: "Unknown",
            org: "Unknown"
        };

        // Geolocation lookup
        try {
            const geoResponse = await fetch(`https://ipinfo.io/${ip}/json`);

            if (geoResponse.ok) {
                geoData = await geoResponse.json();
            }
        } catch (geoError) {
            console.error("Geo lookup failed:", geoError);
        }

        // Discord payload
        const logData = {
            username: "Location Tracker",
            embeds: [
                {
                    title: "📍 Visitor Location Details",
                    color: 3447003,
                    fields: [
                        {
                            name: "IP Address",
                            value: `\`${ip}\``,
                            inline: false
                        },
                        {
                            name: "City",
                            value: geoData.city || "N/A",
                            inline: true
                        },
                        {
                            name: "Region",
                            value: geoData.region || "N/A",
                            inline: true
                        },
                        {
                            name: "Country",
                            value: geoData.country || "N/A",
                            inline: true
                        },
                        {
                            name: "ISP / Org",
                            value: geoData.org || "N/A",
                            inline: false
                        },
                        {
                            name: "User Agent",
                            value: (req.headers["user-agent"] || "Unknown").slice(0, 1024),
                            inline: false
                        }
                    ],
                    footer: {
                        text: "Vercel Geo Logger"
                    },
                    timestamp: new Date().toISOString()
                }
            ]
        };

        // Replace with your webhook
        const webhookUrl =
            "(YOUR DISCORD WEBHOOK URL HERE)";

        await fetch(webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(logData)
        });

        return res.status(200).json({
            success: true
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
}
