      {error && activeTab === "overview" && !analyticsData && (
        <div className="bg-white rounded-xl shadow-xl border p-6 text-center">
          <p className="text-red-500 mb-4">
            Failed to load business insights data
          </p>
          <button
            type="button"
            onClick={() => void handleRefresh()}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Overview — pulse only when no cached data */}
      {activeTab === "overview" && isLoading && !analyticsData && (
        <div className="w-full space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="h-28 bg-slate-200 rounded-xl animate-pulse"
              />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            <div className="h-[360px] bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-[360px] bg-slate-200 rounded-xl animate-pulse" />
          </div>
          <div className="h-64 bg-slate-200 rounded-xl animate-pulse w-full" />
        </div>
      )}

      {activeTab === "overview" && analyticsData && ov && (
        <div
          className={`w-full space-y-8 ${
            dashboardFetching ? "opacity-90" : ""
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            <MetricStatCard
              icon={Building}
              title="Total Hotels"
              subtitle="Listed properties"
              value={formatNumber(ov.totalHotels)}
              iconClassName="bg-blue-100 text-blue-600"
            />
            <MetricStatCard
              icon={Users}
              title="Total Users"
              subtitle="Registered accounts"
              value={formatNumber(ov.totalUsers)}
              iconClassName="bg-green-100 text-green-600"
            />
            <MetricStatCard
              icon={Calendar}
              title="Total Bookings"
              subtitle={`${formatNumber(ov.recentBookings)} last 30 days`}
              value={formatNumber(ov.totalBookings)}
              tone={toneFromNumber(ov.totalBookings)}
              iconClassName="bg-purple-100 text-purple-600"
            />
            <MetricStatCard
              icon={DollarSign}
              title="Total Revenue"
              subtitle="All-time booking value"
              value={formatCurrency(ov.totalRevenue)}
              tone={toneFromNumber(ov.totalRevenue)}
              iconClassName="bg-yellow-100 text-yellow-600"
              footer={
                <div className="flex items-center gap-1">
                  {ov.revenueGrowth >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span
                    className={`text-sm ${
                      (ov.revenueGrowth ?? 0) >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {(ov.revenueGrowth ?? 0).toFixed(1)}% MoM
                  </span>
                </div>
              }
            />
            <MetricStatCard
              icon={DollarSign}
              title="Recent Revenue"
              subtitle="Last 30 days"
              value={formatCurrency(ov.recentRevenue)}
              tone={toneFromNumber(ov.recentRevenue)}
              iconClassName="bg-lime-100 text-lime-700"
            />
            <MetricStatCard
              icon={BedDouble}
              title="Avg LOS"
              subtitle="Nights per booking"
              value={ov.avgLos ?? 0}
              tone={toneFromNumber(ov.avgLos ?? 0)}
              iconClassName="bg-sky-100 text-sky-600"
            />
            <MetricStatCard
              icon={CreditCard}
              title="ADR"
              subtitle="Revenue per room-night"
              value={formatCurrency(ov.adr ?? 0)}
              tone={toneFromNumber(ov.adr ?? 0)}
              iconClassName="bg-cyan-100 text-cyan-600"
            />
            <MetricStatCard
              icon={UserRound}
              title="Pending"
              subtitle={`Party avg ${ov.avgPartySize ?? 0}`}
              value={formatNumber(ov.pendingBookings ?? 0)}
              tone={toneFromNumber(ov.pendingBookings ?? 0, { invert: true })}
              iconClassName="bg-slate-100 text-slate-600"
            />
            <MetricStatCard
              icon={Ban}
              title="Cancelled"
              subtitle={`${cancelRate}% cancellation rate`}
              value={formatNumber(ov.cancelledBookings ?? 0)}
              tone={toneFromNumber(ov.cancelledBookings ?? 0, { invert: true })}
              iconClassName="bg-red-100 text-red-600"
            />
            <MetricStatCard
              icon={Receipt}
              title="Refunded"
              subtitle={formatCurrency(ov.totalRefundAmount ?? 0)}
              value={formatNumber(ov.refundedBookings ?? 0)}
              tone={toneFromNumber(ov.refundedBookings ?? 0, { invert: true })}
              iconClassName="bg-orange-100 text-orange-600"
            />
            <MetricStatCard
              icon={Star}
              title="Reviews"
              subtitle={`Avg ${ov.avgReviewRating ?? 0} ★`}
              value={formatNumber(ov.totalReviews ?? 0)}
              tone={toneFromNumber(ov.totalReviews ?? 0)}
              iconClassName="bg-amber-100 text-amber-600"
            />
            <MetricStatCard
              icon={Sparkles}
              title="Confirmed"
              subtitle={`${formatNumber(ov.verifiedReviewCount ?? 0)} verified reviews`}
              value={formatNumber(ov.confirmedBookings ?? 0)}
              tone={toneFromNumber(ov.confirmedBookings ?? 0)}
              iconClassName="bg-teal-100 text-teal-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            <div className="bg-white rounded-xl shadow-xl border p-6">
              <InsightsCardHeader
                icon={Calendar}
                title="Daily Bookings"
                subtitle="Recent booking volume by day"
                iconClassName="bg-blue-100 text-blue-600"
              />
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.dailyBookings}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                    formatter={(value) => [value, "Bookings"]}
                  />
                  <Bar dataKey="bookings" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                    <LabelList
                      dataKey="bookings"
                      position="top"
                      className="text-xs fill-gray-700"
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-xl border p-6">
              <InsightsCardHeader
                icon={MapPin}
                title="Popular Destinations"
                subtitle="Share of bookings by city"
                iconClassName="bg-emerald-100 text-emerald-600"
              />
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.popularDestinations}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ _id, percent, count }) =>
                      `${_id} ${((percent || 0) * 100).toFixed(0)}% (${count})`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analyticsData.popularDestinations.map((_, index) => (
                      <Cell
                        key={`dest-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [value, "Bookings"]}
                    labelFormatter={(label) => String(label)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            <div className="bg-white rounded-xl shadow-xl border p-6">
              <InsightsCardHeader
                icon={CreditCard}
                title="Payment Status"
                subtitle="Paid / pending / failed / refunded"
                iconClassName="bg-violet-100 text-violet-600"
              />
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={analyticsData.paymentStatusBreakdown ?? []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percent, count }) =>
                      `${status} ${((percent || 0) * 100).toFixed(0)}% (${count})`
                    }
                    outerRadius={80}
                    dataKey="count"
                    nameKey="status"
                  >
                    {(analyticsData.paymentStatusBreakdown ?? []).map(
                      (_, index) => (
                        <Cell
                          key={`pay-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ),
                    )}
                  </Pie>
                  <Tooltip formatter={(value) => [value, "Bookings"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-xl border p-6">
              <InsightsCardHeader
                icon={MapPin}
                title="Destination Revenue"
                subtitle="Bookings, revenue, and avg nightly price"
                iconClassName="bg-emerald-100 text-emerald-700"
              />
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {["City", "Bookings", "Revenue", "Avg price"].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analyticsData.popularDestinations.map((dest) => (
                      <tr key={dest._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {dest._id}
                        </td>
                        <td
                          className={`px-4 py-3 text-sm font-medium ${
                            dest.count > 0 ? "text-green-600" : "text-gray-400"
                          }`}
                        >
                          {dest.count}
                        </td>
                        <td
                          className={`px-4 py-3 text-sm font-medium ${
                            (dest.totalRevenue ?? 0) > 0
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          {formatCurrency(dest.totalRevenue ?? 0)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatCurrency(dest.avgPrice || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xl border p-6 w-full">
            <InsightsCardHeader
              icon={Hotel}
              title="Top Performing Hotels"
              subtitle="Ranked by booking count — click a name for details"
              iconClassName="bg-indigo-100 text-indigo-600"
            />
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "Hotel",
                      "City",
                      "Rating",
                      "Price/Night",
                      "Bookings",
                      "Revenue",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analyticsData.hotelPerformance.slice(0, 10).map((hotel) => (
                    <tr
                      key={String(hotel._id ?? hotel.name)}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-normal">
                        {hotel._id ? (
                          <Link
                            to={`/detail/${hotel._id}`}
                            className="text-sky-600 hover:text-sky-700 hover:underline"
                          >
                            {hotel.name}
                          </Link>
                        ) : (
                          <span className="text-gray-700">{hotel.name}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {hotel.city}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-600">
                        {hotel.starRating} ★
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatCurrency(hotel.pricePerNight)}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          hotel.bookingCount > 0
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      >
                        {hotel.bookingCount}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          hotel.totalRevenue > 0
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      >
                        {formatCurrency(hotel.totalRevenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
