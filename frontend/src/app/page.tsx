async function getUsers() {
  const res = await fetch("http://localhost:5000/api/users", {
    cache: "no-store",
  });
  return res.json();
}

export default async function Home() {
  const users = await getUsers();

  return (
    <main>
      <h1>Users from Backend</h1>
      <ul>
        {users.map((u: any) => (
          <li key={u.id}>{u.name} - {u.email}</li>
        ))}
      </ul>
    </main>
  );
}
