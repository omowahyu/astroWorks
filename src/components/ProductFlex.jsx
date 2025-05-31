export default function ProductFlex({ title }) {
  const dummyData = [
    { name: "SORA", id: 1 },
    { name: "Fantasy Pantry Cabinet", id: 2 },
    { name: "Fantasy Pantry Cabinet", id: 3 },
    { name: "Fantasy Pantry Cabinet", id: 4 },
    { name: "Fantasy Pantry Cabinet", id: 5 },
  ];

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-medium">{title}</h2>
      <div className="overflow-x-auto no-scrollbar">
        <div className="flex space-x-4 pb-2">
          {dummyData.map((item) => (
            <div
              key={item.id}
              className="w-[300px] bg-white rounded-xl shadow/5 overflow-hidden"
            >
              <img
                src={`https://picsum.photos/seed/${item.id}/300/200`}
                alt={item.name}
                className="w-full h-40 object-cover"
              />
              <div className="p-2 text-center font-medium text-sm">
                {item.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
