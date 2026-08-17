      {activeTab === "quality" && isLoading && !analyticsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 bg-slate-200 rounded-xl animate-pulse"
            />
          ))}
        </div>
      )}

      {activeTab === "quality" && ov && (
        <div className="w-full space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricStatCard
              icon={Star}
              title="Total Reviews"
              subtitle="Guest feedback volume"
              value={formatNumber(ov.totalReviews ?? 0)}
              tone={toneFromNumber(ov.totalReviews ?? 0)}
              iconClassName="bg-amber-100 text-amber-600"
            />
            <MetricStatCard
              icon={Sparkles}
              title="Avg Rating"
              subtitle="Across all reviews"
              value={`${ov.avgReviewRating ?? 0} ★`}
              tone={
                (ov.avgReviewRating ?? 0) >= 4
                  ? "positive"
                  : (ov.avgReviewRating ?? 0) >= 3
                    ? "warning"
                    : (ov.avgReviewRating ?? 0) > 0
                      ? "negative"
                      : "neutral"
              }
              iconClassName="bg-yellow-100 text-yellow-600"
            />
            <MetricStatCard
              icon={BadgeCheck}
              title="Verified Reviews"
              subtitle={
                topCategory
                  ? `Top category: ${topCategory.category}`
                  : "Verified guest stays"
              }
              value={formatNumber(ov.verifiedReviewCount ?? 0)}
              tone={toneFromNumber(ov.verifiedReviewCount ?? 0)}
              iconClassName="bg-teal-100 text-teal-600"
            />
            <MetricStatCard
              icon={Ban}
              title="Cancel Rate"
              subtitle={`${formatNumber(ov.cancelledBookings ?? 0)} cancelled`}
              value={`${cancelRate}%`}
              tone={
                cancelRate > 15
                  ? "negative"
                  : cancelRate > 5
                    ? "warning"
                    : "positive"
              }
              iconClassName="bg-red-100 text-red-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-xl border p-6">
              <InsightsCardHeader
                icon={BarChart3}
                title="Booking Status Mix"
                subtitle="Server-side status breakdown"
                iconClassName="bg-indigo-100 text-indigo-600"
              />
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={statusChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis allowDecimals={false} />
                  <Tooltip formatter={(value) => [value, "Bookings"]} />
                  <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]}>
                    <LabelList
                      dataKey="count"
                      position="top"
                      className="text-xs fill-gray-700"
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-xl border p-6">
              <InsightsCardHeader
                icon={Star}
                title="Review Categories"
                subtitle="Average scores by category"
                iconClassName="bg-amber-100 text-amber-600"
              />
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={categoryRows} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 5]} />
                  <YAxis type="category" dataKey="category" width={90} />
                  <Tooltip formatter={(value) => [value, "Avg score"]} />
                  <Bar dataKey="score" fill="#F59E0B" radius={[0, 4, 4, 0]}>
                    <LabelList
                      dataKey="score"
                      position="right"
                      className="text-xs fill-gray-700"
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {(analyticsData.hotelsByStar?.length || analyticsData.guestMix) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {analyticsData.hotelsByStar &&
                analyticsData.hotelsByStar.length > 0 && (
                  <div className="bg-white rounded-xl shadow-xl border p-6">
                    <InsightsCardHeader
                      icon={Hotel}
                      title="Hotels by Star Rating"
                      subtitle="Inventory mix"
                      iconClassName="bg-sky-100 text-sky-600"
                    />
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={analyticsData.hotelsByStar}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="starRating" />
                        <YAxis allowDecimals={false} />
                        <Tooltip formatter={(value) => [value, "Hotels"]} />
                        <Bar
                          dataKey="count"
                          fill="#0EA5E9"
                          radius={[4, 4, 0, 0]}
                        >
                          <LabelList
                            dataKey="count"
                            position="top"
                            className="text-xs fill-gray-700"
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              {analyticsData.guestMix && (
                <div className="bg-white rounded-xl shadow-xl border p-6">
                  <InsightsCardHeader
                    icon={Users}
                    title="Guest Mix"
                    subtitle="Adults vs children across bookings"
                    iconClassName="bg-green-100 text-green-600"
                  />
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Adults",
                            count: analyticsData.guestMix.adults,
                          },
                          {
                            name: "Children",
                            count: analyticsData.guestMix.children,
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent, count }) =>
                          `${name} ${((percent || 0) * 100).toFixed(0)}% (${count})`
                        }
                        outerRadius={80}
                        dataKey="count"
                        nameKey="name"
                      >
                        <Cell fill="#22C55E" />
                        <Cell fill="#A3E635" />
                      </Pie>
                      <Tooltip formatter={(value) => [value, "Guests"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "quality" && !isLoading && !ov && (
        <div className="bg-white rounded-xl border p-6 text-center text-gray-500 text-sm">
          No quality metrics available yet.
        </div>
      )}
