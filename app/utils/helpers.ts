import Sales from "~/models/sales";

export async function generateReceiptNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Get count of sales for today
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    
    const count = await Sales.countDocuments({
        createdAt: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    });
    
    // Format: YYMMDDxxxx where xxxx is the sequential number for the day
    const sequence = (count + 1).toString().padStart(4, '0');
    return \`\${year}\${month}\${day}\${sequence}\`;
}
