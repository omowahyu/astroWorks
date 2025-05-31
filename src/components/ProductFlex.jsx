export default function ProductFlex({ title }) {
  const dummyData = [
    { name: "SORA", id: 1 },
    { name: "Fantasy Pantry Cabinet", id: 2 },
    { name: "Fantasy Pantry Cabinet", id: 3 },
    { name: "Fantasy Pantry Cabinet", id: 4 },
    { name: "Fantasy Pantry Cabinet", id: 5 },
    { name: "Fantasy Pantry Cabinet", id: 6 },
    { name: "Fantasy Pantry Cabinet", id: 7 },
  ];

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-medium">{title}</h2>
      <div className="overflow-x-auto no-scrollbar ">
        <div className="flex gap-4 w-max">
          {dummyData.map((item) => (
            <div
              key={item.id}
              className="w-[560px] bg-white rounded-xl shadow/5 overflow-hidden"
            >
              <img
                src={`https://picsum.photos/seed/${item.id}/700/400`}
                alt={item.name}
                className="w-full h-60 object-cover"
              />
              <div className="w-full p-2 text-center font-medium text-sm">
                {item.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
