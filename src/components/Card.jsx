function Card({ title, value, change, positive }) {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-800 shadow-xl hover:scale-[1.02] transition-all duration-300">
      <p className="text-gray-400 text-sm">{title}</p>

      <h3 className="text-3xl font-bold mt-2">
        {value}
      </h3>

      <span
        className={`text-sm mt-2 block font-medium ${
          positive ? "text-green-400" : "text-red-400"
        }`}
      >
        {change}
      </span>
    </div>
  )
}

export default Card
