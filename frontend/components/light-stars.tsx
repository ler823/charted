import { Ionicons } from "@expo/vector-icons";


const NoStar = () => {
    return (
        <>
            <Ionicons name="star-outline" color="#fefbea" size={15} />
            <Ionicons name="star-outline" color="#fefbea" size={15} />
            <Ionicons name="star-outline" color="#fefbea" size={15} />
            <Ionicons name="star-outline" color="#fefbea" size={15} />
            <Ionicons name="star-outline" color="#fefbea" size={15} />
        </>
    )
}


const OneStar = () => {
    return (
        <>
            <Ionicons name="star" color="#C2A83E" size={15} />
            <Ionicons name="star-outline" color="#fefbea" size={15} />
            <Ionicons name="star-outline" color="#fefbea" size={15} />
            <Ionicons name="star-outline" color="#fefbea" size={15} />
            <Ionicons name="star-outline" color="#fefbea" size={15} />
        </>
    )
}

const TwoStar = () => {
    return (
        <>
            <Ionicons name="star" color="#C2A83E" size={15} />
            <Ionicons name="star" color="#C2A83E" size={15} />
            <Ionicons name="star-outline" color="#fefbea" size={15} />
            <Ionicons name="star-outline" color="#fefbea" size={15} />
            <Ionicons name="star-outline" color="#fefbea" size={15} />
        </>
    )
}

const ThreeStar = () => {
    return (
        <>
            <Ionicons name="star" color="#C2A83E" size={15} />
            <Ionicons name="star" color="#C2A83E" size={15} />
            <Ionicons name="star" color="#C2A83E" size={15} />
            <Ionicons name="star-outline" color="#fefbea" size={15} />
            <Ionicons name="star-outline" color="#fefbea" size={15} />
        </>
    )
}

const FourStar = () => {
    return (
        <>
            <Ionicons name="star" color="#C2A83E" size={15} />
            <Ionicons name="star" color="#C2A83E" size={15} />
            <Ionicons name="star" color="#C2A83E" size={15} />
            <Ionicons name="star" color="#C2A83E" size={15} />
            <Ionicons name="star-outline" color="#fefbea" size={15} />
        </>
    )
}

const FiveStar = () => {
    return (
        <>
            <Ionicons name="star" color="#C2A83E" size={15} />
            <Ionicons name="star" color="#C2A83E" size={15} />
            <Ionicons name="star" color="#C2A83E" size={15} />
            <Ionicons name="star" color="#C2A83E" size={15} />
            <Ionicons name="star" color="#C2A83E" size={15} />
        </>
    )
}


type StarsProps = {
  starnum?: number | null;
};


export const Stars = ({ starnum = 0 }: StarsProps) => {
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
  if ( starnum === 5 ) {
    return <FiveStar />
  }
  else {
    return <NoStar />
  }
}
