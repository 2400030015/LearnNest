import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { NoteCard } from "./NoteCard";
import { FilterBar } from "./FilterBar";

export function Dashboard() {
  const [filters, setFilters] = useState({
    subjectId: undefined as any,
    type: undefined as "notes" | "previous_papers" | "question_papers" | undefined,
    year: undefined as number | undefined,
    search: "",
  });

  const notes = useQuery(api.notes.list, filters);
  const popularNotes = useQuery(api.notes.getPopular);
  const recentNotes = useQuery(api.notes.getRecent);
  const subjects = useQuery(api.subjects.list);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Discover Study Materials
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Access thousands of notes, previous papers, and question papers shared by students worldwide
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBar
        subjects={subjects || []}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Popular Notes Section */}
      {!filters.search && !filters.subjectId && !filters.type && !filters.year && (
        <>
          <section className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="w-6 h-6 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Popular Downloads
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularNotes?.map((note) => (
                <NoteCard key={note._id} note={note} />
              ))}
            </div>
          </section>

          <section className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recently Added
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentNotes?.map((note) => (
                <NoteCard key={note._id} note={note} />
              ))}
            </div>
          </section>
        </>
      )}

      {/* All Notes Section */}
      <section>
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <svg className="w-6 h-6 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          {filters.search || filters.subjectId || filters.type || filters.year ? "Search Results" : "All Materials"}
        </h3>
        
        {notes === undefined ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 text-lg">No materials found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <NoteCard key={note._id} note={note} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
