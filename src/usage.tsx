import useFetchData from "./custom-hook/useFetchdata";

// Example usage
function UserProfile({ userId }: { userId: string }) {
    const url = `https://jsonplaceholder.typicode.com/users/${userId}`;

    const { data, error, isLoading, isValidating } = useFetchData(url, () => fetch(url).then(res => res.json()), {
        refreshInterval: 5000,  // Refresh every 5 seconds
        revalidateOnFocus: true
    });

    if (error) return <div>Error loading user</div>;
    if (isLoading) return <div>Loading...</div>;
    if (isValidating) return <div>Validating...</div>;

    return (
        <div>
            <h1>{data?.name}</h1>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
}

export default UserProfile;
