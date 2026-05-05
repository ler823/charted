import { FilterType } from "@/types/types";
import { createContext, useContext, useState } from "react";

type FilterContextType = {
    filterOptions: FilterType,
    updateFilterOptions: (newFilterOptions: FilterType) => void;
}

const FilterContext = createContext<FilterContextType>({
    filterOptions: {
        self: false,
        friends: null,
        lists: null,
        tags: null,
        openNow: false,
        time: null,
        hour: null,
        minute: null,
        suffix: null,
        distance: null
    },
    updateFilterOptions: () => {}
});

export const FilterProvider = ({ children }: { children: React.ReactNode }) => {
    const [filter, setFilter] = useState<FilterType>({
        self: false,
        friends: null,
        lists: null,
        tags: null,
        openNow: false,
        time: null,
        hour: null,
        minute: null,
        suffix: null,
        distance: null
    });

    const updateFilter = (newFilterOptions: FilterType) => {
        setFilter(newFilterOptions);
    };

    return (
        <FilterContext.Provider value={{ filterOptions: filter, updateFilterOptions: updateFilter }}>
            {children}
        </FilterContext.Provider>
    );
};

export const useFilterContext = () => useContext(FilterContext)