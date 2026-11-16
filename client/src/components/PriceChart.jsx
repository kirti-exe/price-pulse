import {
    LineChart, 
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts"

const storeColors = {
    Amazon: "#ff9900",
    FlipKart: "#2874f0",
    Myntra: "#e91e63",
}

function PriceChart({ history, stores }) {
    return (
        <div className="chart-box">
            <ResponsiveContainer width="100%" height={320}>
                <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={["auto", "auto"]} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip formatter={(v) => `₹${v}`} />
                    <Legend />
                    {stores.map((store) => (
                        <Line   
                            key={store}
                            type="monotone"
                            dataKey={store}
                            stroke={storeColors[store] || "#555"}
                            strokeWidth={2}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

export default PriceChart