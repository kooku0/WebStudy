import React from 'react';

class Test extends React.Component{

    render(){
        return(
            
	<div className="modal-dialog">
		<div className="modal-content">
			<div className="modal-header">
				<h5 className="modal-title" id="exampleModalLongTitle">지역 추가하기</h5>
				<button type="button" className="close" data-dismiss="modal" aria-label="Close">
					<span aria-hidden="true" className="zmdi zmdi-close"></span>
				</button>
			</div>
			<div className="modal-body p-0">
				<div className="row place">
					<div className="col-12 p-0">
						<div className="search-place">
							<form>
								<div className="search-wrapper page-search">
									<button className="search-button-submit" type="submit"><i className="icon dripicons-search"></i></button>
									<input type="text" className="search-input" placeholder="Search..."/>
								</div>
							</form>
						</div>
					</div>
					<div className="col-4 p-0 list-section">
						<div className="list-default disabled">
							<p>업체명을 검색해 주세요. (처음 팝업 켰을 때 띄워 )</p>
						</div>
						<div className="list-none disabled">
							<p>해당 업체 위치가 등록되어 있지 않습니다. 인근 지역으로 검색한 후 지도에서 드래그하여 직접 위치를 선택해 주세요. (검색 결과 없을 때 띄워 줌)</p>
						</div>
						<div className="list-place">
							<div className="present">
								검색 결과 <span>0</span>개의 업체가 있습니다.
							</div>
							<ul>
							</ul>
							<div className="paging_simple_numbers"></div>
						</div>
					</div>
					<div className="col-8 p-0">
						<div id="map" className="map-place" style={{width: '800px',height: '499px'}}>지도
							<button className="new-marker btn btn-primary btn-rounded btn-floating">지도 위 직접 표시</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>



        );
    }
}
export default Test;