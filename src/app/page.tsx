import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-green-600">MeetGrid</h1>
            <Link
              href="/create"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Создать событие
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Планируйте встречи легко
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Создайте событие, поделитесь ссылкой и узнайте, когда все участники свободны
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/create"
              className="px-8 py-4 bg-green-600 text-white text-lg font-medium rounded-lg hover:bg-green-700 transition-colors shadow-lg"
            >
              Создать событие
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Быстрое создание
            </h3>
            <p className="text-gray-600">
              Создайте событие за секунды без регистрации и аккаунтов
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Поделиться ссылкой
            </h3>
            <p className="text-gray-600">
              Отправьте ссылку участникам и соберите их предпочтения по времени
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Лучшее время
            </h3>
            <p className="text-gray-600">
              Автоматически найдём время, когда доступно больше всего участников
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Как это работает
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step: 1, text: "Создайте событие" },
              { step: 2, text: "Поделитесь ссылкой" },
              { step: 3, text: "Участники выбирают время" },
              { step: 4, text: "Найдите лучшее время" },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white rounded-lg shadow-md p-6 text-center"
              >
                <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                  {item.step}
                </div>
                <p className="text-gray-700">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500 text-sm">
            MeetGrid — простой способ планировать встречи
          </p>
          <p className="text-center text-gray-400 text-xs mt-2">
            Creator: <a href="https://t.me/Kotletkad" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-500">@Kotletkad</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
