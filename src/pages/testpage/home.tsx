import AuthorBanner from "../../components/authorbanner"

export default function Testpage() {
    return (
        <div className="bg-[url('/favicon.ico')]">
            <AuthorBanner username={"Lorem napkin"} onlineStatus={false} profileImage={"/favicon.ico"} 
            initialFollowStatus={false} authorDescription={"owner of the nine cats and the sentinel main, owner of the nine cats and the sentinel main"} 
            followers={0} following={0}></AuthorBanner>
        </div>
    )
}