const NewTicket = () => {
  return (
    <div>
      <h1>Create A ticket</h1>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Ticket</label>
          <input className="form-control" />
        </div>
        <div className="form-group">
          <label>Price</label>
          <input className="form-control" />
        </div>
        <button className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
};

export default NewTicket;
