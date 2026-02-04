export const handler = async (event: unknown) => {
    console.log("Event received:", event);
    return {
        statusCode: 200,
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            status: 'alive',
            message: "Smart hub is running"
        })
    }
}