import { Ionicons } from "@expo/vector-icons";


const OneStar = () => {
    return (
        <>
            <Ionicons name="star" color="#C2A83E" size={30} />
            <Ionicons name="star-outline" color="#000000" size={30} />
            <Ionicons name="star-outline" color="#000000" size={30} />
            <Ionicons name="star-outline" color="#000000" size={30} />
            <Ionicons name="star-outline" color="#000000" size={30} />
        </>
    )
}

const TwoStar = () => {
    return (
        <>
            <Ionicons name="star" color="#C2A83E" size={30} />
            <Ionicons name="star" color="#C2A83E" size={30} />
            <Ionicons name="star-outline" color="#000000" size={30} />
            <Ionicons name="star-outline" color="#000000" size={30} />
            <Ionicons name="star-outline" color="#000000" size={30} />
        </>
    )
}

const ThreeStar = () => {
    return (
        <>
            <Ionicons name="star" color="#C2A83E" size={30} />
            <Ionicons name="star" color="#C2A83E" size={30} />
            <Ionicons name="star" color="#C2A83E" size={30} />
            <Ionicons name="star-outline" color="#000000" size={30} />
            <Ionicons name="star-outline" color="#000000" size={30} />
        </>
    )
}

const FourStar = () => {
    return (
        <>
            <Ionicons name="star" color="#C2A83E" size={30} />
            <Ionicons name="star" color="#C2A83E" size={30} />
            <Ionicons name="star" color="#C2A83E" size={30} />
            <Ionicons name="star" color="#C2A83E" size={30} />
            <Ionicons name="star-outline" color="#000000" size={30} />
        </>
    )
}

const FiveStar = () => {
    return (
        <>
            <Ionicons name="star" color="#C2A83E" size={30} />
            <Ionicons name="star" color="#C2A83E" size={30} />
            <Ionicons name="star" color="#C2A83E" size={30} />
            <Ionicons name="star" color="#C2A83E" size={30} />
            <Ionicons name="star" color="#C2A83E" size={30} />
        </>
    )
}


export const Stars = ({ starnum }: { starnum: number }) => {
  if ( starnum === 1 ) {
    return <OneStar />
  }
  if ( starnum === 2 ) {
    return <TwoStar />
  }
  if ( starnum === 3 ) {
    return <ThreeStar />
  }
  if ( starnum === 4 ) {
    return <FourStar />
  }
  else {
    return <FiveStar />
  }
}
