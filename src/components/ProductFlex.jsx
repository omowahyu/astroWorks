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
      <h2 className="text-2xl lg:text-4xl font-medium pb-2 pl-6 lg:pl-20">{title}</h2>
      <div className="overflow-x-auto overflow-y-hidden no-scrollbar"
      style={{WebkitOverflowScrolling: 'touch'}}>
        <div className="flex gap-4 lg:gap-10 w-max pl-6 lg:pl-20">
          {dummyData.map((item) => (
            <div
              key={item.id}
              className="w-[200px] lg:w-[400px] bg-white"
            >
              <div className="rounded-xl shadow/5 overflow-hidden">
                <img
                  src={`https://picsum.photos/seed/${item.id}/500/400`}
                  alt={item.name}
                  className="w-full h-60 object-cover hidden lg:block"
                />

                <img
                  src={`https://picsum.photos/seed/${item.id}/300/700`}
                  alt={item.name}
                  className="w-full h-60 object-cover lg:hidden"
                />
              </div>
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
